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
    const correctHash = "2bb80d537b1da3e38bd30361aa855686bde0ba1d5f2bcd9e42c5f65b9f5f3f29"; // "secret" のSHA-256
    if (hashHex !== correctHash) {
      alert("パスワードが違います");
      document.body.innerHTML = "";
    }
  });
  