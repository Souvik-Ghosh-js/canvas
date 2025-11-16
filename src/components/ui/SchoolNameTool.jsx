import React from "react";
const names = [
  {
    name: "Sunrise Academy",
  },
  {
    name: "Oakwood Preparatory School",
  },
  {
    name: "Willow Creek High School",
  },
  {
    name: "Maple Leaf Elementary",
  },
  {
    name: "Pine Ridge Middle School",
  },
  {
    name: "Horizon Science Academy",
  },
  {
    name: "Bayside Secondary School",
  },
  {
    name: "Crestview International School",
  },
  {
    name: "Riverbend Primary School",
  },
  {
    name: "Beacon Hill Preparatory",
  },
];
function SchoolNameTool({ addSchoolName }) {
  return (
    <div>
      <section>
        <h1 className=" font-semibold mb-2">School Name</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="h-[250px] overflow-y-scroll mt-2">
        {names.map((name, index) => (
          <h3
            key={index}
            className="text-xl text-center cursor-pointer font-extrabold mb-2 hover:text-gray-600 transition-colors"
            onClick={() => addSchoolName(name.name)}
          >
            {name.name}
          </h3>
        ))}
      </section>
    </div>
  );
}

export default SchoolNameTool;
