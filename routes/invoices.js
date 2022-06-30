"use strict";

const express = require("express");
const { route } = require("../app");
const db = require("../db");

const router = new express.Router();

router.get("/", async function (req, res) {
  const results = await db.query(`
  SELECT id, comp_code
  FROM invoices`);
  const invoices = results.rows;
  return res.json({ invoices });
});

router.get("/:id", async function (req, res) {
  const id = req.params.id;
  const invResults = await db.query(
    `
  SELECT id, amt, paid, add_date, paid_date,comp_code
  FROM invoices
    WHERE id = $1`,
    [id]
  );
  const invoice = invResults.rows[0];
  const cResults = await db.query(
    `
    SELECT code,name,description
    FROM companies
    WHERE code = $1`,
    [invoice.comp_code]
  );
  invoice.company = cResults.rows[0];
  return res.json({ invoice });
});

router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;
  const result = await db.query(
    `INSERT INTO invoices (comp_code,amt)
    VALUES ($1,$2)
    RETURNING comp_code,amt`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];
  return res.status(201).json({ invoice });
});

module.exports = router;
