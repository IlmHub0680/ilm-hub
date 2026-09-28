/*
 * ============================================================
 * XHR UPLOAD WITH REAL PROGRESS
 * ============================================================
 *
 * fetch() cannot report upload progress -- there is no upload
 * progress event on the Fetch API, only on XMLHttpRequest. This
 * module wraps XHR in a fetch()-shaped promise so call sites don't
 * have to hand-roll XHR boilerplate, while still surfacing real
 * byte-level percentage updates via onProgress(percent).
 *
 * This does not change what gets uploaded, which endpoint receives
 * it, or how the server processes it -- it only replaces the
 * network transport for the handful of call sites that previously
 * showed a static "Uploading..." label with no real progress, so
 * they can show a real percentage instead. Server-side upload
 * handling (mime/size validation, multipart parsing, R2 writes) is
 * untouched.
 */

export function uploadFileWithProgress(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = true;

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let parsed = null;
      try {
        parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch (err) {
        reject(new Error('The server returned an unexpected response.'));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(parsed);
      } else {
        reject(new Error((parsed && parsed.error) || `Upload failed (status ${xhr.status}).`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('A network error interrupted the upload. Please try again.'));
    };

    xhr.onabort = () => {
      reject(new Error('The upload was cancelled.'));
    };

    xhr.send(formData);
  });
}
