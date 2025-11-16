import React from "react";

function Inputs({ icon, value, onChange, type }) {
  return (
    <section className="flex gap-2 w-[100px] border-2 bg-gray-100 px-1 items-center">
      <h1 className="text-gray-500">{icon}</h1>
      <input
        type={type}
        value={value}
        className="w-full outline-0"
        onChange={onChange}
      />
    </section>
  );
}

export default Inputs;
