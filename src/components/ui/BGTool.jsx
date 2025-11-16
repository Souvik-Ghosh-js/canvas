import React from "react";

const bgs = [
  {
    url: "./assets/bg/bg (1).jpg",
  },
  {
    url: "./assets/bg/bg (2).jpg",
  },
  {
    url: "./assets/bg/bg (3).jpg",
  },
  {
    url: "./assets/bg/bg (4).jpg",
  },
  {
    url: "./assets/bg/bg (5).jpg",
  },
  {
    url: "./assets/bg/bg (6).jpg",
  },
  {
    url: "./assets/bg/bg (7).jpg",
  },
  {
    url: "./assets/bg/bg (8).jpg",
  },
  {
    url: "./assets/bg/bg (9).jpg",
  },
  {
    url: "./assets/bg/bg (10).jpg",
  },
];

function BGTool({ addBackground }) {
  return (
    <div>
      <section>
        <h1 className=" font-semibold mb-2">Backgrounds</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="flex flex-wrap justify-between gap-2 mt-5 px-4 h-80 overflow-scroll overflow-x-hidden">
        {bgs.map((bg, index) => (
          <img
            key={index}
            src={bg.url}
            alt=""
            className="h-30 cursor-pointer"
            onClick={() => {
              addBackground(bg.url);
            }}
          />
        ))}
      </section>
    </div>
  );
}

export default BGTool;
