# Custom fixture example

Create a fixture directory:

```sh
mkdir -p fixtures/local/product-page
cat > fixtures/local/product-page/input.html <<'HTML'
<article>
  <h1>Widget</h1>
  <p>Ships &amp; returns locally.</p>
</article>
HTML
cat > fixtures/local/product-page/expected.txt <<'TEXT'
Widget
Ships & returns locally.
TEXT
cat > fixtures/local/product-page/meta.json <<'JSON'
{
  "id": "product-page",
  "title": "Product page copy",
  "tags": ["commerce", "entities"],
  "notes": "Checks entity decoding in product copy."
}
JSON
```

Run it:

```sh
node bin/plainforge.js inspect fixtures/local --output out/local
```
