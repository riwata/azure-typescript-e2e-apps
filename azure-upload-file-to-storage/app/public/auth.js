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
    const correctHash = "37b72d911201662a9113cda9a3d2627fb1e2d175567e5eec816a27252b851d1d"; // "secret" のSHA-256
    if (hashHex !== correctHash) {
      alert("パスワードが違います");
      document.body.innerHTML = "";
    }
  });
  