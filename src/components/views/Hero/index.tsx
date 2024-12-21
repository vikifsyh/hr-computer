"use client";
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
import Link from "next/link";

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
    <div className="my-20 relative">
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
        <div className="max-w-lg mt-10 md:mt-0 relative">
          <Image alt="Hero" src={HeroImage} width={1000} height={1000} />
          <div className="absolute bottom-0 -left-6">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 0C22.7469 11.8271 32.1728 21.2531 44 22C32.1728 22.7469 22.7469 32.1728 22 44C21.2531 32.1728 11.8271 22.7469 0 22C11.8271 21.2531 21.2531 11.8271 22 0Z"
                fill="black"
              />
            </svg>
          </div>
          <div className="absolute top-0 -right-2">
            <svg
              width="67"
              height="67"
              viewBox="0 0 67 67"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.5 0C34.6373 18.0095 48.9904 32.3627 67 33.5C48.9904 34.6373 34.6373 48.9904 33.5 67C32.3627 48.9904 18.0095 34.6373 0 33.5C18.0095 32.3627 32.3627 18.0095 33.5 0Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="w-full bg-white border-b border-neutral-50">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-neutral-900">
            Merek Laptop Terpercaya
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Pilih dari berbagai merek laptop terbaik kami.
          </p>
        </div>
        <Marquee pauseOnHover={false} gradient={false}>
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
      <div className="flex bg-gray-100 fixed right-3 top-[285px] p-2 rounded-full flex-col gap-4 z-10">
        <Link
          href={
            "https://www.instagram.com/laptopmurahcilacappurwokerto/profilecard/?igsh=MTV6eGY5dDY3ZXd4cg== "
          }
          className="bg-gray-300 p-2 rounded-full overflow-hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
              fill="#0F0F0F"
            />
            <path
              d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"
              fill="#0F0F0F"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"
              fill="#0F0F0F"
            />
          </svg>
        </Link>
        <Link
          href={"http://shopee.co.id/heruryzencomputer"}
          className="bg-gray-300 p-2 rounded-full overflow-hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.75004 6.5V5.75C2.64734 5.74999 2.54572 5.77108 2.4515 5.81196C2.35728 5.85284 2.27246 5.91263 2.20229 5.98764C2.13213 6.06264 2.07812 6.15126 2.04361 6.24799C2.0091 6.34473 1.99482 6.44752 2.00167 6.55L2.75004 6.5ZM21.25 6.5L21.9984 6.55C22.0053 6.44752 21.991 6.34473 21.9565 6.24799C21.922 6.15126 21.868 6.06264 21.7978 5.98764C21.7276 5.91263 21.6428 5.85284 21.5486 5.81196C21.4544 5.77108 21.3527 5.74999 21.25 5.75V6.5ZM4.37392 19.5831L3.49842 6.45013L2.00167 6.54988L2.87729 19.6829L4.37392 19.5831ZM21.1228 19.6829L21.9984 6.54988L20.5017 6.45013L19.6262 19.5831L21.1228 19.6829ZM19.6262 19.5831C19.6051 19.8996 19.4645 20.1961 19.2329 20.4128C19.0013 20.6295 18.6961 20.75 18.3789 20.75V22.25C19.8267 22.25 21.0265 21.1275 21.1228 19.6829L19.6262 19.5831ZM2.87729 19.6829C2.97354 21.1275 4.17342 22.25 5.62104 22.25V20.75C5.30393 20.75 4.99868 20.6294 4.76712 20.4128C4.53556 20.1961 4.39501 19.8995 4.37392 19.5831L2.87729 19.6829ZM9.25004 6C9.25004 4.48125 10.4813 3.25 12 3.25V1.75C9.65279 1.75 7.75004 3.65275 7.75004 6H9.25004ZM12 3.25C13.5188 3.25 14.75 4.48125 14.75 6H16.25C16.25 3.65275 14.3473 1.75 12 1.75V3.25ZM2.75004 7.25H21.25V5.75H2.75004V7.25ZM5.62117 22.25H18.3788V20.75H5.62117V22.25Z"
              fill="black"
            />
            <path
              d="M14.25 10.5H11C10.0335 10.5 9.25 11.2835 9.25 12.25C9.25 13.2165 10.0335 14 11 14H11.5M11.25 14H13C13.9665 14 14.75 14.7835 14.75 15.75C14.75 16.7165 13.9665 17.5 13 17.5H9.75"
              stroke="black"
              strokeWidth="1.9375"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <Link
          href={"https://www.facebook.com/share/15thfuFwww/"}
          className="bg-gray-300 p-2 rounded-full overflow-hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1829_318)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.1855 24V13.2H17.4644L18 8.4H14.1855V6.06211C14.1855 4.82611 14.2171 3.6 15.9443 3.6H17.6936V0.168164C17.6936 0.116564 16.191 0 14.6708 0C11.496 0 9.50808 1.98863 9.50808 5.64023V8.4H6V13.2H9.50808V24H14.1855Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_1829_318">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </Link>
        <Link
          href={"https://wa.me/6285848706395"}
          className="bg-gray-300 p-2 rounded-full overflow-hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.50002 12C3.50002 7.30558 7.3056 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C10.3278 20.5 8.77127 20.0182 7.45798 19.1861C7.21357 19.0313 6.91408 18.9899 6.63684 19.0726L3.75769 19.9319L4.84173 17.3953C4.96986 17.0955 4.94379 16.7521 4.77187 16.4751C3.9657 15.176 3.50002 13.6439 3.50002 12ZM12 1.5C6.20103 1.5 1.50002 6.20101 1.50002 12C1.50002 13.8381 1.97316 15.5683 2.80465 17.0727L1.08047 21.107C0.928049 21.4637 0.995611 21.8763 1.25382 22.1657C1.51203 22.4552 1.91432 22.5692 2.28599 22.4582L6.78541 21.1155C8.32245 21.9965 10.1037 22.5 12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5ZM14.2925 14.1824L12.9783 15.1081C12.3628 14.7575 11.6823 14.2681 10.9997 13.5855C10.2901 12.8759 9.76402 12.1433 9.37612 11.4713L10.2113 10.7624C10.5697 10.4582 10.6678 9.94533 10.447 9.53028L9.38284 7.53028C9.23954 7.26097 8.98116 7.0718 8.68115 7.01654C8.38113 6.96129 8.07231 7.046 7.84247 7.24659L7.52696 7.52195C6.76823 8.18414 6.3195 9.2723 6.69141 10.3741C7.07698 11.5163 7.89983 13.314 9.58552 14.9997C11.3991 16.8133 13.2413 17.5275 14.3186 17.8049C15.1866 18.0283 16.008 17.7288 16.5868 17.2572L17.1783 16.7752C17.4313 16.5691 17.5678 16.2524 17.544 15.9269C17.5201 15.6014 17.3389 15.308 17.0585 15.1409L15.3802 14.1409C15.0412 13.939 14.6152 13.9552 14.2925 14.1824Z"
              fill="black"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
