CREATE INDEX study_event_student ON public.study_events((payload::jsonb ->> 'studentId'),seq);
CREATE INDEX study_event_thread ON public.study_events((payload::jsonb ->> 'threadId'),seq);
CREATE INDEX study_event_edition ON public.study_events((payload::jsonb #>> '{thread,editionId}'),seq);
