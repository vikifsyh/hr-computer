"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-gray-800">
      {/* Hero Section */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-10 mb-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Tentang Kami
          </h1>
          <p className="text-lg text-gray-600">
            HR Computer hadir untuk Anda yang ingin membeli atau menjual laptop
            second berkualitas dan juga mendapatkan layanan servis terpercaya.
            Dengan pengalaman dan komitmen, kami siap membantu Anda!
          </p>
        </div>
        <div className="flex-1">
          <Image
            src="image/about-laptop.svg" // Simpan gambar dari Freepik ke folder public, contoh: /public/about-laptop.svg
            alt="Tentang Kami"
            width={500}
            height={400}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Who we are */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Siapa Kami?
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Kami adalah penyedia laptop second terpercaya yang juga melayani jasa
          servis laptop semua jenis. Berbasis di Indonesia, kami telah dipercaya
          oleh ribuan pelanggan untuk memberikan solusi terbaik untuk kebutuhan
          digital mereka.
        </p>
      </section>

      {/* Services */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Apa yang Kami Tawarkan?
        </h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Laptop second berkualitas, bergaransi resmi toko</li>
          <li>Servis laptop profesional & cepat</li>
          <li>Konsultasi pembelian laptop sesuai kebutuhan</li>
          <li>Garansi after-sales & dukungan teknis</li>
        </ul>
      </section>

      {/* Why Choose Us */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Kenapa Memilih Kami?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="font-bold text-primary">Aman & Terpercaya</h3>
            <p className="text-gray-600 mt-1">
              Transaksi aman, produk jelas, dan semua unit telah melalui uji
              kualitas.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="font-bold text-primary">Teknisi Berpengalaman</h3>
            <p className="text-gray-600 mt-1">
              Tim kami terdiri dari teknisi yang sudah berpengalaman di dunia IT
              dan perakitan laptop.
            </p>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <div className="my-12">
        <Image
          src="image/repair-team.svg" // Gambar ilustrasi teknisi, pastikan ada di folder public
          alt="Tim Servis"
          width={800}
          height={400}
          className="mx-auto rounded-md"
        />
      </div>

      {/* Contact Us */}
      <section className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ingin Konsultasi atau Tanya Produk?
        </h2>
        <p className="text-gray-600 mb-4">
          Tim kami siap membantu Anda kapan saja!
        </p>
        <Link
          href="https://wa.me/6285848706395?text=Halo,%20saya%20ingin%20konsultasi%20produk%20laptop%20second%20di%20HR%20Computer."
          className="inline-block mt-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          Hubungi Kami
        </Link>
      </section>
    </div>
  );
};

export default About;
