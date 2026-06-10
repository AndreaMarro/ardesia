"""Tests for the ASR module — all mock, no real model downloads or ffmpeg calls."""

from __future__ import annotations

import json
import math
import os
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from lessonos.asr.convert import _find_ffmpeg, convert_to_wav
from lessonos.asr.models import (
    SpeechSegment,
    segments_from_jsonl,
    segments_to_jsonl,
)
from lessonos.asr.pipeline import run_asr_pipeline
from lessonos.asr.transcribe import (
    DEFAULT_MODEL,
    FALLBACK_MODEL,
    MODEL_SIZES,
    _get_model,
    transcribe_audio,
    transcribe_with_fallback,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def fake_wav(tmp_path: Path) -> str:
    """Create a minimal valid WAV file for testing."""
    path = tmp_path / "test_audio.wav"
    # Minimal WAV header: 44 bytes, 16kHz mono, 1 sec of silence
    sample_rate = 16000
    num_samples = sample_rate  # 1 second
    data_size = num_samples * 2  # 16-bit = 2 bytes/sample
    header = b"RIFF"
    header += (36 + data_size).to_bytes(4, "little")
    header += b"WAVE"
    header += b"fmt "
    header += (16).to_bytes(4, "little")
    header += (1).to_bytes(2, "little")  # PCM
    header += (1).to_bytes(2, "little")  # mono
    header += sample_rate.to_bytes(4, "little")
    header += (sample_rate * 2).to_bytes(4, "little")  # byte rate
    header += (2).to_bytes(2, "little")  # block align
    header += (16).to_bytes(2, "little")  # bits per sample
    header += data_size.to_bytes(4, "little")
    header += b"\x00" * data_size
    path.write_bytes(header)
    return str(path)


@pytest.fixture
def fake_m4a(tmp_path: Path) -> str:
    """Create a fake m4a-style file (just placeholder bytes)."""
    path = tmp_path / "Prima_lezione_teoria_dei_segnali.m4a"
    path.write_bytes(b"\x00" * 1024)
    return str(path)


@pytest.fixture
def mock_whisper_model() -> MagicMock:
    """Return a mock faster-whisper model that yields test segments."""
    model = MagicMock()

    class FakeSegment:
        """Simulate faster-whisper Segment dataclass attributes."""

        def __init__(self, start: float, end: float, text: str):
            self.start = start
            self.end = end
            self.text = text
            self.avg_logprob = -0.5

    def fake_transcribe(*args, **kwargs) -> tuple[list[FakeSegment], MagicMock]:
        segments = [
            FakeSegment(0.0, 2.5, "Benvenuti alla lezione di teoria dei segnali."),
            FakeSegment(2.5, 5.0, "Oggi parleremo dei segnali elementari."),
            FakeSegment(5.0, 8.2, "Un segnale rect ha ampiezza costante su un intervallo."),
        ]
        info = MagicMock()
        info.language = "it"
        info.duration = 8.2
        return segments, info

    model.transcribe = fake_transcribe
    return model


# ---------------------------------------------------------------------------
# Models tests
# ---------------------------------------------------------------------------


class TestSpeechSegment:
    def test_to_dict_roundtrip(self):
        seg = SpeechSegment(start=1.0, end=2.5, text="Ciao", confidence=0.95)
        d = seg.to_dict()
        restored = SpeechSegment.from_dict(d)
        assert restored == seg
        assert restored.start == 1.0
        assert restored.text == "Ciao"

    def test_to_dict_rounding(self):
        seg = SpeechSegment(start=1.123456, end=2.789012, text="test", confidence=0.98765)
        d = seg.to_dict()
        assert d["start"] == 1.123
        assert d["end"] == 2.789
        assert d["confidence"] == 0.9877

    def test_from_dict_defaults(self):
        seg = SpeechSegment.from_dict({"start": 0, "end": 1})
        assert seg.text == ""
        assert seg.confidence == 0.0
        assert seg.speaker is None

    def test_from_dict_missing_end_raises(self):
        with pytest.raises(KeyError):
            SpeechSegment.from_dict({"start": 0})

    def test_equality_by_value(self):
        s1 = SpeechSegment(0.0, 1.0, "a")
        s2 = SpeechSegment(0.0, 1.0, "a")
        assert s1 == s2


class TestSegmentsJsonl:
    def test_write_then_read(self, tmp_path: Path):
        segs = [
            SpeechSegment(0.0, 1.0, "Primo"),
            SpeechSegment(1.0, 2.5, "Secondo", confidence=0.9),
        ]
        path = str(tmp_path / "out.jsonl")
        segments_to_jsonl(segs, path)
        assert os.path.isfile(path)

        restored = list(segments_from_jsonl(path))
        assert restored == segs

    def test_empty_segments(self, tmp_path: Path):
        path = str(tmp_path / "empty.jsonl")
        segments_to_jsonl([], path)
        content = Path(path).read_text()
        assert content == ""

    def test_skip_empty_lines(self, tmp_path: Path):
        path = tmp_path / "mixed.jsonl"
        path.write_text(
            json.dumps(SpeechSegment(0.0, 1.0, "a").to_dict())
            + "\n\n"
            + json.dumps(SpeechSegment(1.0, 2.0, "b").to_dict())
            + "\n"
        )
        segs = list(segments_from_jsonl(str(path)))
        assert len(segs) == 2


# ---------------------------------------------------------------------------
# Converter tests
# ---------------------------------------------------------------------------


class TestConvertToWav:
    def test_file_not_found(self):
        with pytest.raises(FileNotFoundError, match="not found"):
            convert_to_wav("/nonexistent/file.m4a", "/tmp")

    def test_skips_existing_output(self, tmp_path: Path, fake_m4a: str):
        """If output WAV already exists, no ffmpeg call."""
        out_dir = str(tmp_path / "out")
        os.makedirs(out_dir, exist_ok=True)
        existing_wav = os.path.join(out_dir, "Prima_lezione_teoria_dei_segnali_16k_mono.wav")
        Path(existing_wav).touch()

        with patch("lessonos.asr.convert.subprocess.run") as mock_run:
            result = convert_to_wav(fake_m4a, out_dir)
            assert result == existing_wav
            mock_run.assert_not_called()

    def test_successful_conversion(self, tmp_path: Path, fake_m4a: str):
        """ffmpeg called with correct args when output does not exist."""
        out_dir = str(tmp_path / "out")
        os.makedirs(out_dir, exist_ok=True)

        expected_out = os.path.join(out_dir, "Prima_lezione_teoria_dei_segnali_16k_mono.wav")

        with patch("lessonos.asr.convert.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stderr="")
            result = convert_to_wav(fake_m4a, out_dir)

        # Check ffmpeg was called
        mock_run.assert_called_once()
        cmd = mock_run.call_args[0][0]
        assert cmd[0].endswith("ffmpeg")
        assert "-ar" in cmd
        assert "16000" in cmd
        assert "-ac" in cmd
        assert "1" in cmd
        assert result == expected_out

    def test_ffmpeg_failure(self, tmp_path: Path, fake_m4a: str):
        out_dir = str(tmp_path / "out")
        os.makedirs(out_dir, exist_ok=True)

        with patch("lessonos.asr.convert.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stderr="unknown encoder")
            with pytest.raises(RuntimeError, match="ffmpeg failed"):
                convert_to_wav(fake_m4a, out_dir)

    def test_find_ffmpeg_prefers_homebrew(self):
        """_find_ffmpeg returns homebrew path when it exists."""
        with patch("os.path.isfile") as mock_isfile:
            mock_isfile.return_value = True
            path = _find_ffmpeg()
        assert path == "/opt/homebrew/bin/ffmpeg"

    def test_find_ffmpeg_fallsback_to_path(self):
        """When no common path exists, falls back to 'ffmpeg' from PATH."""
        with patch("os.path.isfile") as mock_isfile:
            mock_isfile.return_value = False
            path = _find_ffmpeg()
        assert path == "ffmpeg"


# ---------------------------------------------------------------------------
# Transcriber tests
# ---------------------------------------------------------------------------


class TestTranscribeAudio:
    def test_file_not_found(self):
        with pytest.raises(FileNotFoundError, match="not found"):
            transcribe_audio("/nonexistent.wav")

    def test_invalid_model_size(self, fake_wav: str):
        with pytest.raises(ValueError, match="Unrecognized model size"):
            transcribe_audio(fake_wav, model_size="invalid-size")

    def test_successful_transcription(self, fake_wav: str, mock_whisper_model: MagicMock):
        with patch("lessonos.asr.transcribe._get_model", return_value=mock_whisper_model):
            segments = transcribe_audio(fake_wav, model_size="tiny")
        assert len(segments) == 3
        assert segments[0].start == 0.0
        assert segments[0].end == 2.5
        assert "Benvenuti" in segments[0].text
        assert segments[0].confidence == round(math.exp(-0.5), 4)
        assert segments[2].text == "Un segnale rect ha ampiezza costante su un intervallo."

    def test_vad_disabled(self, fake_wav: str):
        """When vad=False, vad_filter=False should be passed to model.transcribe."""
        model = MagicMock()
        captured_kwargs = {}

        def fake_transcribe(*args, **kwargs):
            captured_kwargs.update(kwargs)
            return [MagicMock(start=0, end=1, text="x", avg_logprob=-0.5)], MagicMock()

        model.transcribe = fake_transcribe

        with patch("lessonos.asr.transcribe._get_model", return_value=model):
            transcribe_audio(fake_wav, model_size="tiny", vad=False)

        assert captured_kwargs.get("vad_filter") is False


class TestTranscribeWithFallback:
    def test_fallback_on_error(self, fake_wav: str, mock_whisper_model: MagicMock):
        """When primary model fails, fallback should succeed."""
        with patch("lessonos.asr.transcribe.transcribe_audio") as mock_t:
            # First call (primary) raises error, second (fallback) succeeds
            mock_t.side_effect = [
                RuntimeError("OOM on large model"),
                [
                    SpeechSegment(0.0, 1.0, "Fallback text"),
                ],
            ]
            segments = transcribe_with_fallback(
                fake_wav, primary_model="large-v3-turbo", fallback_model="tiny"
            )
        assert len(segments) == 1
        assert segments[0].text == "Fallback text"
        assert mock_t.call_count == 2

    def test_primary_succeeds(self, fake_wav: str):
        """When primary succeeds, fallback is not called."""
        with patch("lessonos.asr.transcribe.transcribe_audio") as mock_t:
            mock_t.return_value = [SpeechSegment(0.0, 1.0, "Primary text")]
            segments = transcribe_with_fallback(
                fake_wav, primary_model="large-v3-turbo", fallback_model="tiny"
            )
        assert len(segments) == 1
        assert segments[0].text == "Primary text"
        assert mock_t.call_count == 1


class TestGetModel:
    def test_invalid_size(self):
        with pytest.raises(ValueError, match="Unrecognized model size"):
            _get_model("nonexistent")


# ---------------------------------------------------------------------------
# Pipeline integration tests
# ---------------------------------------------------------------------------


class TestRunAsrPipeline:
    def test_audio_not_found(self):
        with pytest.raises(FileNotFoundError, match="not found"):
            run_asr_pipeline("/nonexistent.m4a", "/tmp")

    def test_full_pipeline_mocked(
        self, fake_m4a: str, tmp_path: Path, mock_whisper_model: MagicMock
    ):
        """Full pipeline with all external calls mocked."""
        out_dir = str(tmp_path / "asr_output")

        with (
            patch("lessonos.asr.pipeline.convert_to_wav") as mock_convert,
            patch("lessonos.asr.pipeline.transcribe_with_fallback") as mock_transcribe,
        ):
            mock_convert.return_value = str(tmp_path / "converted.wav")
            mock_transcribe.return_value = [
                SpeechSegment(0.0, 2.5, "Mock segment one."),
                SpeechSegment(2.5, 5.0, "Mock segment two."),
            ]

            result = run_asr_pipeline(fake_m4a, out_dir)

        # Check JSONL exists and has correct content
        assert os.path.isfile(result)
        segs = list(segments_from_jsonl(result))
        assert len(segs) == 2
        assert segs[0].text == "Mock segment one."
        assert segs[1].start == 2.5

        mock_convert.assert_called_once_with(fake_m4a, out_dir)
        mock_transcribe.assert_called_once()

    def test_output_dir_created(self, tmp_path: Path, fake_m4a: str):
        """Output directory is created if it doesn't exist."""
        out_dir = str(tmp_path / "nonexistent" / "deep" / "dir")

        with (
            patch("lessonos.asr.pipeline.convert_to_wav") as mock_convert,
            patch("lessonos.asr.pipeline.transcribe_with_fallback") as mock_transcribe,
        ):
            mock_convert.return_value = str(tmp_path / "converted.wav")
            mock_transcribe.return_value = [SpeechSegment(0.0, 1.0, "test")]

            result = run_asr_pipeline(fake_m4a, out_dir)

        assert os.path.isdir(out_dir)
        assert os.path.isfile(result)


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------


class TestEdgeCases:
    def test_speech_segment_empty_text(self):
        seg = SpeechSegment.from_dict({"start": 0, "end": 1})
        assert seg.text == ""

    def test_speech_segment_negative_start(self):
        """Edge case: negative start times should be preserved (whisper won't produce them, but we don't clamp)."""
        seg = SpeechSegment(-0.1, 1.0, "preamble")
        assert seg.start == -0.1

    def test_segments_jsonl_unicode(self, tmp_path: Path):
        """Unicode text (Italian accents) roundtrips correctly."""
        text = "Segnale è un funzione — l'energia è finita?"
        seg = SpeechSegment(0.0, 1.0, text)
        path = str(tmp_path / "unicode.jsonl")
        segments_to_jsonl([seg], path)
        restored = list(segments_from_jsonl(path))
        assert restored[0].text == text

    def test_transcribe_with_language_param(self, fake_wav: str):
        """language parameter is passed through to model.transcribe."""
        model = MagicMock()
        captured_kwargs = {}

        def fake_transcribe(*args, **kwargs):
            captured_kwargs.update(kwargs)
            return [MagicMock(start=0, end=1, text="x", avg_logprob=-0.5)], MagicMock()

        model.transcribe = fake_transcribe

        with patch("lessonos.asr.transcribe._get_model", return_value=model):
            transcribe_audio(fake_wav, model_size="tiny", language="it")

        assert captured_kwargs.get("language") == "it"
