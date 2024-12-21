"use client";
import ClickToAction from "@/components/views/Cta";
import ProductFilter from "@/components/views/Filter";
import Hero from "@/components/views/Hero";
import AllProduct from "@/components/views/Product";
import Recommend from "@/components/views/Recommend";
import React from "react";

export default function page() {
  return (
    <>
      <Hero />
      <AllProduct />
      <Recommend />
      <ProductFilter />
      <ClickToAction />
    </>
  );
}
