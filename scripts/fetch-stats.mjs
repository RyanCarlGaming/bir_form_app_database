const url = 'http://localhost:3001/api/forms/stats/summary';

async function run() {
  try {
    const res = await fetch(url);
    const body = await res.json();
    console.log('HTTP', res.status);
    console.dir(body, { depth: null });
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

run();
