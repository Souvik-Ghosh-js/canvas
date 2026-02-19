import React from "react";

function TextTool({ action, addWordCurvature }) {
  return (
    <div>
      <section>
        <h1 className=" font-semibold mb-2">Text style</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="mt-2">
        <button
          className="border-gray-200 border-2 w-full rounded-sm h-10 text-2xl font-bold cursor-pointer mb-2 hover:bg-gray-200 transition-all"
          onClick={action.addHeadingText}
        >
          Heading
        </button>
        <button
          className="border-gray-200 border-2 w-full rounded-sm h-10 text-md font-bold cursor-pointer mb-2 hover:bg-gray-200 transition-all "
          onClick={action.addSubHeadingText}
        >
          Sub-Heading
        </button>
        <button
          className="border-gray-200 border-2 w-full rounded-sm h-10  cursor-pointer mb-2 hover:bg-gray-200 transition-all"
          onClick={action.addSimpleText}
        >
          Simple Text
        </button>
        <button
          className="border-gray-200 border-2 w-full rounded-sm h-10  cursor-pointer mb-2 hover:bg-gray-200 transition-all"
          onClick={action.addBengaliText}
        >
          বাংলা ফন্ট
        </button>
      </section>
      <section>
        <h1 className=" font-semibold mb-2">Word Art</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="flex flex-wrap gap-3">
        <h1
          className="inline-block font-extrabold text-6xl cursor-pointer bg-linear-to-t  from-orange-400  to-orange-700  bg-clip-text text-transparent text-outline-black-thick"
          onClick={action.addWordArt_1}
        >
          A
        </h1>
        <h1
          className="text-6xl cursor-pointer font-extrabold  text-[#5B9FE2]  text-outline-white [text-shadow:4px_4px_1px_rgba(40,120,255,0.4)]"
          onClick={action.addWordArt_2}
        >
          A
        </h1>
        <h1
          className="text-6xl cursor-pointer font-extrabold  text-[#000]  text-outline-white [text-shadow:4px_4px_0px_rgba(40,120,255,0.7)]"
          onClick={action.addWordArt_3}
        >
          A
        </h1>{" "}
        <h1
          className="text-6xl cursor-pointer font-extrabold text-black  text-outline-white [text-shadow:4px_4px_1px_rgba(0,0,0,0.4)]"
          onClick={action.addWordArt_4}
        >
          A
        </h1>{" "}
        <h1
          className="text-6xl cursor-pointer font-extrabold  text-white  text-outline-orange [text-shadow:3px_3px_0px_rgba(255,106,0,0.8)]"
          onClick={action.addWordArt_5}
        >
          A
        </h1>{" "}
        <h1
          className="text-6xl cursor-pointer font-extrabold  text-[#475AE6]  [text-shadow:4px_4px_3px_rgba(0,0,0,0.3)]"
          onClick={action.addWordArt_6}
        >
          A
        </h1>{" "}
        <h1
          className="text-6xl cursor-pointer font-extrabold  text-white  text-outline-blue [text-shadow:4px_4px_4px_rgba(0,0,0,0.3)]"
          onClick={action.addWordArt_7}
        >
          A
        </h1>
      </section>
     

    </div>
  );
}

export default TextTool;
