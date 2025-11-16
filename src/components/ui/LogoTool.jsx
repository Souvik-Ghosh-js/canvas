import React from "react";

const logos = [
  {
    url: "./assets/logo/logo (1).png",
  },
  {
    url: "./assets/logo/logo (2).png",
  },
  {
    url: "./assets/logo/logo (3).png",
  },
  {
    url: "./assets/logo/logo (4).png",
  },
  {
    url: "./assets/logo/logo (5).png",
  },
  {
    url: "./assets/logo/logo (6).png",
  },
];

function LogoTool({ addBackground }) {
  return (
    <div>
      <section>
        <h1 className=" font-semibold mb-2">School Logo</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="flex flex-wrap justify-between  mt-5 px-4 h-80 overflow-scroll overflow-x-hidden">
        {logos.map((logo, index) => (
          <img
            key={index}
            src={logo.url}
            alt=""
            className="h-20 w-20 object-cover cursor-pointer"
            onClick={() => {
              addBackground(logo.url);
            }}
          />
        ))}
      </section>
    </div>
  );
}

export default LogoTool;
