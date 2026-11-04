# Skrip demo (3 minit) — untuk Rizal

**Sebelum mula**

1. `npm run seed` (isi 5 pesanan contoh).
2. `npm run dev` (FakeModel, percuma) atau `npm run demo:real` (Claude sebenar, kos duit).
3. Buka dua tab sebelah-menyebelah: `localhost:3000/chat` dan `localhost:3000/dashboard`.

Semua nama dan mesej dalam demo ini palsu.

---

## 1. Papan pemilik (30 saat)

Tab **/dashboard**.

> "Ini papan untuk tuan kedai. Setiap mesej WhatsApp yang masuk jadi satu baris. Lajur sama macam Google Sheet yang kedai guna sekarang."

Tunjuk 3 jenis baris:

- **Dihantar**: pesanan yang dah diluluskan. Balasan dah sampai kepada pelanggan.
- **Menunggu**: AI dah baca pesanan dan tulis draf balasan. Tunggu tuan kedai luluskan.
- **Semak ini = Ya** (kuning): AI tak pasti, atau mesej bukan pesanan. Tuan kedai yang putuskan.

## 2. Pelanggan hantar pesanan (45 saat)

Tab **/chat**. Pilih pelanggan **Siti Contoh (palsu)**.

Taip dan hantar:

```
2 bekas tart nenas, ambil 25hb
```

> "Pelanggan taip macam biasa. Singkatan, campur Melayu-English pun boleh."

Tunjuk: mesej keluar dalam chat. **Belum ada balasan.**

## 3. Baris baru muncul (30 saat)

Tab **/dashboard**. Dalam beberapa saat baris baru muncul di atas:

- Barang: Tart nenas x2
- Tarikh ambil: 2026-11-25
- Draf balasan: siap dengan jumlah harga

> "AI baca pesanan, kira jumlah, tukar '25hb' jadi tarikh betul, dan tulis draf. Tapi dia tak hantar apa-apa sendiri."

## 4. Tuan kedai ubah draf dan luluskan (45 saat)

Dalam kotak **Draf balasan**, tambah sesuatu, contohnya: `Terima kasih Siti!`

Tekan **Lulus**. Status bertukar jadi **Dihantar**.

> "Tuan kedai sentiasa pegang kawalan. Tiada balasan keluar tanpa butang Lulus."

## 5. Balasan sampai (30 saat)

Tab **/chat**. Balasan yang dah diubah muncul dalam chat Siti.

> "Yang pelanggan nampak ialah ayat tuan kedai, bukan ayat asal AI."

---

## Yang demo ni tak buat lagi

- WhatsApp sebenar (Meta WhatsApp Cloud API)
- Google Sheet sebenar
- Banyak kedai dalam satu sistem
- Hosting (sekarang jalan di laptop sahaja)
