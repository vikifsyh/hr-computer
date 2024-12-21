"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#f0f0f0] mx-4 md:mx-8  rounded-t-lg  py-10 mt-20">
      <div className="container mx-auto px-5 md:px-20">
        {/* Footer Content */}
        <div className="md:flex md:justify-between">
          {/* Jam Kerja */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Jam Kerja</h3>
            <p>Senin - Jumat: 07.00 - 21.00</p>
            <p>Sabtu: 09.00 - 19.00</p>
            <p>Minggu: Tutup</p>
          </div>

          {/* Lokasi */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Lokasi Kami</h3>
            <p className="max-w-sm text-justify">
              Perumahan permata buana blok D20, Kedawung, Kec. Kroya, Kabupaten
              Cilacap, Jawa Tengah 53282, Indonesia (Perumahan permata buana
              blok D20, Kedawung, Kec. Kroya, Kabupaten Cilacap, Jawa Tengah
              53282, Indonesia)
            </p>
          </div>

          {/* Lokasi maps */}
          <div className="max-w-sm">
            <h3 className="text-xl font-bold mb-4">Lokasi di Peta</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3954.5290358417515!2d109.247489!3d-7.626111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zN8KwMzcnMzQuMCJTIDEwOcKwMTQnNTEuMCJF!5e0!3m2!1sid!2sid!4v1734764576133!5m2!1sid!2sid"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: "10px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 text-center border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-500">
            © 2025 HR Computer. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
