"use strict";

const express = require("express");
const { route } = require("../app");
const db = require("../db");
const { NotFoundError } = require("../expressError");

const router = new express.Router();


/** Returns all the invoices from our invoice list
 * Expected: {invoices: [{id, comp_code}, ...]}
 */

router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices`
  );

  const invoices = results.rows;
  return res.json({ invoices });
});

/** Returns information about a single invoice in JSON
 *  Returns 404 error if the invoice does not exist.
 *  Expected: {invoice:{ id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

router.get("/:id", async function (req, res) {
  const id = req.params.id;
  const invResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code 
      FROM invoices
      WHERE id=$1`, [id]
  );

  const invoice = invResults.rows[0];
  if (invResults.rows.length === 0) {
    throw new NotFoundError();
  }
  
  const cResults = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code=$1`, [invoice.comp_code]
  );

  invoice.company = cResults.rows[0];

  return res.json({ invoice });
});

/** Adds an invoice to our invoice list. Only takes the comp_code and amount from request body.
 * Returns information about the invoice added.
 * Expected: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;
  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING comp_code, amt, id, paid, add_date, paid_date`, [comp_code, amt]
  );

  const invoice = result.rows[0];
  return res.status(201).json({ invoice });
});

/** Updates information about an invoice. Only takes the amount from the request body
 *  Returns all information about that invoice. 
 *  Returns 404 error if the invoice does not exist.
 *  Expected: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.put("/:id", async function (req, res) {
  const { amt } = req.body;
  const result = await db.query(
    `UPDATE invoices
      SET amt=$1
      WHERE id=$2
      RETURNING comp_code, amt, paid, add_date, paid_date`, [amt, req.params.id]
  );
  const invoice = result.rows[0];

  if (result.rows.length === 0) {
    throw new NotFoundError();
  }
  return res.json({ invoice });

})

/** Deletes a company from our invoice list if the company exists.
 * Returns 404 error if the invoice does not exist
 * Expected : {status : "deleted"}
 */

router.delete("/:id", async function (req, res) {
  const result = await db.query(
    `DELETE FROM invoices WHERE id=$1 
    RETURNING comp_code, amt, paid, add_date, paid_date`, [req.params.id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError();
  }
  return res.json({ status: "deleted" });
});


module.exports = router;
