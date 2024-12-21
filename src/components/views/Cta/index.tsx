import Link from "next/link";
import React from "react";
import ImageCTA from "../../../../public/image/file (6) 1.png";
import Image from "next/image";

export default function ClickToAction() {
  return (
    <section className="bg-primary mx-8 md:mx-16 my-12 rounded-3xl flex justify-between">
      <div className="py-8 px-4  mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="max-w-screen-md">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white">
            Nantikan Promo Menarik Semua Produk
          </h2>
          <p className="mb-8 font-light text-white sm:text-xl ">
            Dapatkan harga terbaik dan garansi di setiap pembelian, sesuaikan
            anggaranmu tanpa mengorbankan kualitas.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link
              href="#"
              className="inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center bg-white text-primary border border-primary rounded-lg hover:bg-primary hover:text-white focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
            >
              Shop Now
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              View more
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-sm hidden md:block">
        <Image src={ImageCTA} alt="CTA" width={500} height={500} />
      </div>
    </section>
  );
}
