"use strict";

const express = require("express");
const db = require("../db");

const router = new express.Router();

/** Returns a list of companies with all their information:
 *
 * {companies : [
 *  {"code": "apple", "name": "Apple Computer", "description": "Maker of OSX."},
	{"code": "ibm","name": "IBM","description": "Big blue."}
    ]}
 *
 */

router.get("/", async function (req, res) {
  const result = await db.query(
    `SELECT code, name, description
        FROM companies`
  );
  const companies = result.rows;
  return res.json({ companies: companies });
});

router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const result = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [code]
  );
  const company = result.rows[0];
  return res.json({ company });
});

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code,name,description)
        VALUES ($1,$2,$3)
        RETURNING code,name,description`,
    [code, name, description]
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});

module.exports = router;

router.put("/:code", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
          SET name = $1, description = $2
          WHERE code = $3
          RETURNING code,name,description`,
    [name, description, req.params.code]
  );
  const company = result.rows[0];
  return res.json({ company });
});

module.exports = router;
