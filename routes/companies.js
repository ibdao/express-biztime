"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");

const router = new express.Router();

/** Returns a list of companies with all their information:
 *
 * Expected: {companies : [
 *  {"code": "apple", "name": "Apple Computer", "description": "Maker of OSX."},
 *  {"code": "ibm","name": "IBM","description": "Big blue."}]}
 *
 */

router.get("/", async function (req, res) {
  const result = await db.query(
    `SELECT code, name, description
        FROM companies`
  );
  const companies = result.rows;
  return res.json({ companies });
});

/** Returns information about a single company in JSON
 *  Returns 404 error if the company does not exist.
 *  Expected: {company: {code, name, description, invoices: [id, ...]}}
 */

router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const result = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code=$1`, [code]
  );
  
  const company = result.rows[0];
  if (result.rows.length === 0) {
    throw new NotFoundError();
  }

  const invResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code 
      FROM invoices
      WHERE comp_code=$1`, [code]
  );

  company.invoice = invResults.rows[0];


  return res.json({ company });
});

/** Adds an company to our company list
 * Returns information about the company added.
 * Expected: {company: {code, name, description}}
 */

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code,name,description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});

/** Updates information about a company.
 *  Returns all information about that company. 
 *  Returns 404 error if the company does not exist.
 *  Expected: {company: {code, name, description}}
 */

router.put("/:code", async function (req, res) {
  const { code, name, description } = req.body;
  const result = await db.query(
    `UPDATE companies
          SET name = $1, description = $2
          WHERE code = $3
          RETURNING code, name, description`,
    [name, description, req.params.code]
  );
  const company = result.rows[0];

  if (result.rows.length === 0) {
    throw new NotFoundError();
  }
  return res.json({ company });
});

/** Deletes a company from our company list if the company exists.
 * Returns 404 error if the company does not exist
 * Expected : {status : "deleted"}
 */

router.delete("/:code", async function (req, res) {
  const result = await db.query(
    `DELETE FROM companies WHERE code = $1 RETURNING code, name, description`,
    [req.params.code]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError();
  }
  return res.json({ status: "Deleted" });
});

module.exports = router;
