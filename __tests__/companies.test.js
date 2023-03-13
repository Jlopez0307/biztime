process.env.NODE_ENV = "test";

const request = require('supertest')
const app = require("../app");
const db = require('../db')

let testCompany;
let testInvoice;

beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'test_comp', 'A test company')
        RETURNING *
    `);
    const invoiceResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', 50)
        RETURNING *    
    `);

    testInvoice = invoiceResult.rows[0];
    testCompany = compResult.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
})


afterAll(async () => {
    await db.end()
});

describe('/GET /companies', () => {
    test('Gets all companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [testCompany]})
    });

    test('Gets a company based on company_code', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        console.log(res)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: testCompany,
            invoices: testInvoice
        });
    });
});

describe('POST /companies', () => {
    test('Create new company', async () => {
        const res = await request(app).post('/companies').send({
            code: "sony",
            name: "playstation",
            description: "Sonys console"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ company: {
            code: "sony",
            name: "playstation",
            description: "Sonys console"
        }});
    })
})

describe('PUT /companies/:code', () => {
    test('Updates a company', async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({
            name:'changingName',
            description: 'Changing company for a test',
            
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            code: testCompany.code,
            name:'changingName',
            description: 'Changing company for a test'
        }})
    });
    test('Responds with 404 for invalid name', async () => {
        const res = await request(app).patch(`/cats/Piggles`).send({name:'George_Chonk'})
        expect(res.statusCode).toBe(404);
    });
});

describe('/DELETE /companies/:code', () => { 
    test('Deleting a company', async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: 'deleted'})
    });

    test('Responds with 404 for deleting invalid company', async () => {
        const res = await request(app).patch(`/cats/hamface`)
        expect(res.statusCode).toBe(404);
    });
 })