const db = require("./db");

const internships = [
  {
    code: "INT-101",
    title: "Frontend Intern",
    domain: "Web Development",
    mode: "Remote",
    location: "Bengaluru",
    skills: ["HTML", "CSS", "JavaScript"],
    openings: 2
  },
  {
    code: "INT-102",
    title: "API Engineering Intern",
    domain: "Backend Development",
    mode: "Hybrid",
    location: "Hyderabad",
    skills: ["Node.js", "Express", "REST API"],
    openings: 2
  },
  {
    code: "INT-103",
    title: "UI/UX Intern",
    domain: "Design",
    mode: "Remote",
    location: "India",
    skills: ["Figma", "UI Design", "UX Research"],
    openings: 1
  },
  {
    code: "INT-104",
    title: "Data Analyst Intern",
    domain: "Data Analytics",
    mode: "Hybrid",
    location: "Bengaluru",
    skills: ["Python", "SQL", "Excel"],
    openings: 3
  },
  {
    code: "INT-105",
    title: "Security Operations Intern",
    domain: "Cybersecurity",
    mode: "On-site",
    location: "Hyderabad",
    skills: ["Networking", "Linux", "Security"],
    openings: 2
  }
];

db.serialize(() => {
  db.run("DELETE FROM internships");

  const stmt = db.prepare(`
    INSERT INTO internships
    (code, title, domain, mode, location, skills, openings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  internships.forEach((internship) => {
    stmt.run(
      internship.code,
      internship.title,
      internship.domain,
      internship.mode,
      internship.location,
      JSON.stringify(internship.skills),
      internship.openings
    );
  });

  stmt.finalize(() => {
    console.log("Internship seed data inserted successfully.");
    db.close();
  });
});
