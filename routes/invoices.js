const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const slugify = require('slugify');
const db = require("../db");

router.get('/', async ( req, res, next) => {
    try{
        const resp = await db.query(`SELECT * FROM invoices`);
        if( resp.rows.length === 0){
            throw new ExpressError('Invoices not found', 404);
        };

        return res.status(200).json({invoices: resp.rows});

    } catch(err){
        return next(err);
    }
})

router.get('/:id', async ( req, res, next) => {
    try{
        const { id } = req.params;
        const resp = await db.query(`SELECT * FROM invoices WHERE id = $1`, [ id ]);
        if( resp.rows.length === 0){
            throw new ExpressError('Invoices not found', 404);
        };

        return res.status(200).json({invoice: resp.rows[0]})
    } catch(err){
        return next(err);
    };
});

router.post('/', async ( req, res, next ) => {
    try{
        const { comp_code , amt } = req.body;
        const resp = await db.query(`INSERT INTO invoices (comp_code , amt) VALUES ($1, $2) RETURNING *`, [ comp_code, amt ]);

        return res.status(201).json({invoice: resp.rows[0]});
    } catch( err ){
        return next(err);
    }
});

router.put('/:id', async ( req, res, next ) => {
    try{
        const { id } = req.params;
        const { amt, paid } = req.body;
        let resp;

        if(paid === true){
            resp = await db.query(
                `UPDATE invoices SET amt = $1, paid = $2 , paid_date = CURRENT_DATE WHERE id = $3 RETURNING *`, 
                [ amt, paid, id ]
            );
        } else if(paid === false) {
            resp = await db.query(
                `UPDATE invoices SET amt = $1, paid = $2, paid_date = null WHERE id = $3 RETURNING *`, 
                [ amt, paid, id ]
            );
        }

        if(resp.rows === 0){
            throw new ExpressError('Invoice not found', 404);
        };
    
        return res.status(200).json({invoice: resp.rows[0]});
    } catch(err){
        return next(err);
    }
});

module.exports = router;