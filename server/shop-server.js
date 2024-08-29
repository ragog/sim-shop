import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

let revenue = 0;

let inventory = [
    { productName: 'magazine', price: 1, stock: 20 },
    { productName: 'chocolate bar', price: 2, stock: 30 },
    { productName: 'newspaper', price: 3, stock: 14 },
    { productName: 'crisps', price: 4, stock: 40 },
    { productName: 'ice cream', price: 5, stock: 27 },
];

app.get('/ask/:product', (req, res) => {
    const product = inventory.find(element => element.productName === req.params.product);
    res.send(product)
});

app.put('/buy', (req, res) => {

    const product = inventory.find(element => element.productName === req.body.item);

    const amountRequested = req.body.amount;

    if (product) {
        if (product.stock >= amountRequested) {
            product.stock = product.stock - amountRequested;
            console.log(`sold ${amountRequested}x ${req.body.item} for ${product.price}, remaining ${product.stock}`);
            revenue += amountRequested * product.price;
            console.log(revenue)
        } else {
            console.log(`product ${product.productName} out of stock!`)
        }
    }

	res.status(200).send();
});

app.listen(port, () => {
	console.log(`Shop server listening on ${port}`);
});
