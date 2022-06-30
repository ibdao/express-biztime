"use strict";

const express = require('express');
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

router.get("/", async function (req, res){
    const result = await db.query(
        `SELECT code, name, description 
        FROM companies`);
    const companies = result.rows;
    return res.json({ "companies" : companies });
});

router.get("/:code", async function (req, res){
    const code = req.params.code;
    const result = await db.query(
        `SELECT code, name, description 
        FROM companies 
        WHERE code = $1`, [code]);
    const company = result.rows[0];
    return res.json({ company })
})


































module.exports = router;