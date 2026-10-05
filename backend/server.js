const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ---------- Frontend Home ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ---------- Validation ----------
function validateInternship(data) {
  const errors = [];

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim().length < 2
  ) {
    errors.push(
      "Title is required and must contain at least 2 characters."
    );
  }

  if (
    !data.domain ||
    typeof data.domain !== "string" ||
    data.domain.trim().length < 2
  ) {
    errors.push("Domain is required.");
  }

  if (!["Remote", "Hybrid", "On-site"].includes(data.mode)) {
    errors.push("Mode must be Remote, Hybrid, or On-site.");
  }

  if (
    !data.location ||
    typeof data.location !== "string" ||
    data.location.trim().length < 2
  ) {
    errors.push("Location is required.");
  }

  if (
    !Array.isArray(data.skills) ||
    data.skills.length === 0
  ) {
    errors.push("Skills must be a non-empty array.");
  }

  if (
    !Number.isInteger(data.openings) ||
    data.openings <= 0
  ) {
    errors.push("Openings must be a positive integer.");
  }

  return errors;
}

// ---------- Format Internship ----------
function formatInternship(row) {
  return {
    ...row,
    skills: JSON.parse(row.skills)
  };
}

// ---------- GET All Internships + Pagination ----------
app.get("/api/internships", (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 5;
  }

  if (limit > 50) {
    limit = 50;
  }

  const offset = (page - 1) * limit;

  db.get(
    "SELECT COUNT(*) AS total FROM internships",
    [],
    (countErr, countRow) => {
      if (countErr) {
        return res.status(500).json({
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: countErr.message
          }
        });
      }

      db.all(
        `
        SELECT *
        FROM internships
        ORDER BY id ASC
        LIMIT ? OFFSET ?
        `,
        [limit, offset],
        (err, rows) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: {
                code: "DATABASE_ERROR",
                message: err.message
              }
            });
          }

          const data = rows.map(formatInternship);

          res.status(200).json({
            success: true,
            data,
            pagination: {
              page,
              limit,
              total: countRow.total,
              totalPages: Math.ceil(countRow.total / limit)
            }
          });
        }
      );
    }
  );
});

// ---------- GET Internship By ID ----------
app.get("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "ID must be a positive number."
      }
    });
  }

  db.get(
    "SELECT * FROM internships WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: err.message
          }
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Internship not found."
          }
        });
      }

      res.status(200).json({
        success: true,
        data: formatInternship(row)
      });
    }
  );
});

// ---------- POST Create Internship ----------
app.post("/api/internships", (req, res) => {
  const errors = validateInternship(req.body);

  if (
    !req.body.code ||
    typeof req.body.code !== "string" ||
    req.body.code.trim().length < 2
  ) {
    errors.push(
      "Code is required and must contain at least 2 characters."
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        details: errors
      }
    });
  }

  const {
    code,
    title,
    domain,
    mode,
    location,
    skills,
    openings
  } = req.body;

  const sql = `
    INSERT INTO internships
    (
      code,
      title,
      domain,
      mode,
      location,
      skills,
      openings
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      code.trim(),
      title.trim(),
      domain.trim(),
      mode,
      location.trim(),
      JSON.stringify(skills),
      openings
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(409).json({
            success: false,
            error: {
              code: "DUPLICATE_CODE",
              message: "Internship code already exists."
            }
          });
        }

        return res.status(500).json({
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: err.message
          }
        });
      }

      db.get(
        "SELECT * FROM internships WHERE id = ?",
        [this.lastID],
        (getErr, row) => {
          if (getErr) {
            return res.status(500).json({
              success: false,
              error: {
                code: "DATABASE_ERROR",
                message: getErr.message
              }
            });
          }

          res.status(201).json({
            success: true,
            message: "Internship created successfully.",
            data: formatInternship(row)
          });
        }
      );
    }
  );
});

// ---------- PUT Update Internship ----------
app.put("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "ID must be a positive number."
      }
    });
  }

  const errors = validateInternship(req.body);

  if (
    !req.body.code ||
    typeof req.body.code !== "string" ||
    req.body.code.trim().length < 2
  ) {
    errors.push(
      "Code is required and must contain at least 2 characters."
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        details: errors
      }
    });
  }

  const {
    code,
    title,
    domain,
    mode,
    location,
    skills,
    openings
  } = req.body;

  const sql = `
    UPDATE internships
    SET
      code = ?,
      title = ?,
      domain = ?,
      mode = ?,
      location = ?,
      skills = ?,
      openings = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      code.trim(),
      title.trim(),
      domain.trim(),
      mode,
      location.trim(),
      JSON.stringify(skills),
      openings,
      id
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(409).json({
            success: false,
            error: {
              code: "DUPLICATE_CODE",
              message: "Internship code already exists."
            }
          });
        }

        return res.status(500).json({
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: err.message
          }
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Internship not found."
          }
        });
      }

      db.get(
        "SELECT * FROM internships WHERE id = ?",
        [id],
        (getErr, row) => {
          if (getErr) {
            return res.status(500).json({
              success: false,
              error: {
                code: "DATABASE_ERROR",
                message: getErr.message
              }
            });
          }

          res.status(200).json({
            success: true,
            message: "Internship updated successfully.",
            data: formatInternship(row)
          });
        }
      );
    }
  );
});

// ---------- DELETE Internship ----------
app.delete("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "ID must be a positive number."
      }
    });
  }

  db.run(
    "DELETE FROM internships WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: err.message
          }
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Internship not found."
          }
        });
      }

      res.status(200).json({
        success: true,
        message: "Internship deleted successfully."
      });
    }
  );
});

// ---------- API 404 ----------
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "API endpoint not found."
    }
  });
});

// ---------- General 404 ----------
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
