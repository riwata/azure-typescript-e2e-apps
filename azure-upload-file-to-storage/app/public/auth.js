document.addEventListener('DOMContentLoaded', async function() {
    const password = prompt("パスワードを入力してください:");
    if (!password) {
      alert("パスワードは必須です");
      document.body.innerHTML = "";
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const correctHash = "6775dfa3361aee460171ca71bdde50f8643e2e6acc304cfa42cf0fac2900b6f0"; // "secret" のSHA-256
    if (hashHex !== correctHash) {
      alert("パスワードが違います");
      document.body.innerHTML = "";
    }
  });
  