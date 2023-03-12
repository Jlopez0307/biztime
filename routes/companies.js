const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async ( req, res, next) => {
    try{
        const response = await db.query(`SELECT * FROM companies`);
        if(response.rows.length === 0){
            throw new ExpressError('No companies found', 404);
        };
        return res.json({companies: response.rows});

    } catch(err){
        return next(err);
    };
});

router.get('/:code', async ( req, res, next) => {
    try{
        const { code } = req.params;

        const compResp = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        const invoiceResp = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code]);

        if(compResp.rows.length === 0){
            throw new ExpressError(`${code} doesnt exist`, 404);
        };
        return res.json({
            company: compResp.rows[0],
            invoices: invoiceResp.rows[0]
        });
    } catch(err){
        return next(err)
    };
});

router.post('/', async ( req, res, next) => {
    try{
        const { code, name, description } = req.body;

        const resp = await db.query(`INSERT INTO companies (code,name,description) VALUES ($1, $2, $3) RETURNING *`, [code,name,description]);
        return res.status(201).json({company: resp.rows[0]});

    } catch(err){
        return next(err);
    }
});

router.put('/:code', async ( req ,res, next ) => {
    try{
        const { name, description } = req.body;
        const { code } = req.params;

        const resp = await db.query(`UPDATE companies SET name = $1 ,description = $2 WHERE code = $3 RETURNING *`, [ name, description, code ]);
        if(resp.rows[0].length === 0){
            throw new ExpressError('Company not found', 404);
        }
        return res.status(200).json({company: resp.rows[0]});

    } catch(err){
        return next(err);
    };
});

router.delete('/:code', async ( req, res, next) => {
    try{
        const resp = await db.query(`DELETE FROM companies WHERE code = $1`, [req.params]);
        if(!resp === 0){
            throw new ExpressError('Company doesnt exist', 404);
        };
        return res.send({status: "deleted"});

    } catch (err){
        return next(err);
    };
});

module.exports = router;