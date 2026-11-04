# Skrip demo (3 minit) — untuk Rizal

**Sebelum mula**

1. `npm run seed` (isi 6 pesanan contoh).
2. `npm run dev` (FakeModel, percuma) atau `npm run demo:real` (Gemini sebenar, kos duit). Terminal cetak alamat `Phone: http://…/chat?as=siti`.
3. Laptop: buka `localhost:3000/dashboard`. Telefon (Wi-Fi sama): buka alamat `Phone:` tadi. Tiada telefon? Buka `localhost:3000/chat?as=siti` dalam tab kedua.

Semua nama dan mesej dalam demo ini palsu.

---

## 1. Papan pemilik (30 saat)

Tab **/dashboard**.

> "Ini papan untuk tuan kedai. Chat yang bersepah masuk, senarai pesanan yang kemas keluar. Satu baris untuk satu pesanan: masa, pelanggan, barang, tarikh ambil, jumlah RM. Klik baris untuk tengok mesej asal, apa yang AI faham, dan draf balasan di sebelah kanan."

Tunjuk:

- **Menunggu** (baris atas): AI dah baca pesanan dan tulis draf. Tunggu tuan kedai luluskan.
- **Teks oren** dalam lajur Pesanan: AI minta tuan kedai semak. "Tak pasti: “yang biasa”" (AI tanya balik dalam draf), "Soalan, bukan pesanan", atau "AI gagal baca".
- **Dihantar** (baris kelabu di bawah): dah diluluskan. Balasan dah sampai kepada pelanggan.
- **Untuk dibuat** (bawah jadual): jumlah kuih ikut tarikh ambil. Ini yang tuan kedai perlu bakar.

## 2. Pelanggan hantar pesanan (45 saat)

Telefon (atau tab **/chat?as=siti**): chat Siti.

Taip dan hantar:

```
2 bekas tart nenas, ambil 25hb
```

> "Pelanggan taip macam biasa. Singkatan, campur Melayu-English pun boleh."

Tunjuk: mesej keluar dalam chat. **Belum ada balasan.**

## 3. Pesanan baru muncul (30 saat)

Tab **/dashboard**. Dalam beberapa saat baris baru muncul (Menunggu). Klik baris itu:

- Pesanan: 2 × Tart nenas, RM 50
- Ambil: Rab, 25 Nov
- Draf balasan: siap dengan jumlah harga
- **Untuk dibuat** dapat baris baru: Rabu, 25 Nov

> "AI baca pesanan, kira jumlah, tukar '25hb' jadi tarikh betul, dan tulis draf. Tapi dia tak hantar apa-apa sendiri."

## 4. Tuan kedai ubah draf dan luluskan (45 saat)

Dalam kotak **Draf balasan**, tambah sesuatu, contohnya: `Terima kasih Siti!`

Tekan **Lulus & hantar**. Baris jadi kelabu, status **Dihantar**.

> "Tuan kedai sentiasa pegang kawalan. Tiada balasan keluar tanpa butang Lulus & hantar."

## 5. Balasan sampai (30 saat)

Telefon. "sedang menaip…" keluar sekejap, kemudian balasan yang dah diubah muncul dalam chat Siti. Tanda ✓✓ jadi biru.

> "Yang pelanggan nampak ialah ayat tuan kedai, bukan ayat asal AI."

---

## Yang demo ni tak buat lagi

- WhatsApp sebenar (Meta WhatsApp Cloud API)
- Google Sheet sebenar
- Banyak kedai dalam satu sistem
- Hosting (sekarang jalan di laptop sahaja)
