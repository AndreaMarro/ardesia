"""Exercise concurrent notebook writes through the public application, using synthetic demo sessions."""
import concurrent.futures
import http.cookiejar
import json
import os
import threading
import urllib.request

BASE = os.environ["OFFICINA_BASE_URL"].rstrip("/")
if not BASE.startswith("https://"):
    raise ValueError("Il test richiede il servizio HTTPS.")
barrier = threading.Barrier(4)


def exercise(index):
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def request(path, data=None):
        req = urllib.request.Request(BASE + path, headers={"Origin": BASE, "Content-Type": "application/json",
            "X-Astra-Request": "1"}, data=None if data is None else json.dumps(data).encode())
        with opener.open(req, timeout=40) as reply:
            return json.load(reply)
    request("/api/demo", {})
    try:
        barrier.wait(timeout=30)
        run = request("/api/runs", {"course": "C1", "item": "C1-Q027", "mode": "practice",
                                   "requestId": "collaudo-concorrente-" + str(index)})
        path = "/api/run/" + run["id"]
        assert request(path)["items"][0]["id"] == "C1-Q027"
        request(path, {"action": "answer", "idx": 0, "value": "-2"})
        answer = request(path)["items"][0]
        assert answer["sent"] and answer["answer"] == "-2"
        return index
    finally:
        request("/api/logout", {})


if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        assert sorted(pool.map(exercise, range(4))) == list(range(4))
    print("Quattro quaderni avviati, verificati, riaperti e chiusi sul dominio HTTPS.")
