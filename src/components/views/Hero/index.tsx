import React from "react";
import HeroImage from "../../../../public/image/hero.png";
import Image from "next/image";
import { Aclonica } from "next/font/google";
import Marquee from "react-fast-marquee";
import Asus from "../../../../public/image/asus.png";
import Acer from "../../../../public/image/acer.png";
import Toshiba from "../../../../public/image/toshiba.png";
import HP from "../../../../public/image/HP-PNG.png";
import Lenovo from "../../../../public/image/lenovo.png";
import Axio from "../../../../public/image/axio.png";

const aclonica = Aclonica({
  subsets: ["latin"],
  weight: "400",
});

const brands = [
  {
    id: 1,
    image: Asus,
  },
  {
    id: 2,
    image: Acer,
  },
  {
    id: 3,
    image: Toshiba,
  },
  {
    id: 4,
    image: Lenovo,
  },
  {
    id: 5,
    image: Axio,
  },
  {
    id: 6,
    image: HP,
  },
];
export default function Hero() {
  return (
    <div className="my-20">
      <div className="md:flex md:justify-between items-center mx-5 md:mx-[100px] my-10 md:my-[100px] ">
        <div className="max-w-lg">
          <h1 className={`${aclonica.className} text-3xl md:text-6xl`}>
            LAPTOP KUAT PERFORMA HEBAT!
          </h1>
          <p className="text-black/60 mt-6">
            Dapatkan harga terbaik dan garansi di setiap pembelian, sesuaikan
            anggaranmu tanpa mengorbankan kualitas.
          </p>
          <button className="bg-primary text-white px-6 py-3 rounded-full mt-5 w-full md:w-auto hover:bg-primary/50">
            Beli Sekarang
          </button>

          <div className="flex gap-5 items-center mt-5 md:mt-10">
            <div className="text-center">
              <p className="text-4xl font-medium">200+</p>
              <p>Produk Terjual</p>
            </div>
            <div>
              <svg
                width="1"
                height="68"
                viewBox="0 0 1 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0.5"
                  y1="-2.18557e-08"
                  x2="0.500003"
                  y2="68"
                  stroke="black"
                  strokeOpacity="0.1"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-4xl font-medium">29</p>
              <p>Produk Tersedia</p>
            </div>
          </div>
        </div>
        <div className="max-w-lg mt-10 md:mt-0">
          <Image alt="Hero" src={HeroImage} width={1000} height={1000} />
        </div>
      </div>
      <div className="w-full bg-primary-100">
        <Marquee pauseOnHover={true} gradient={false}>
          <div className="flex py-3 md:py-6 gap-24 w-full items-center">
            {brands.map((data) => (
              <figure key={data.id} className="">
                <figcaption className="max-w-40">
                  <div className="">
                    <Image
                      alt="profil"
                      src={data.image}
                      className="object-cover"
                    />
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Marquee>
      </div>
    </div>
  );
}
