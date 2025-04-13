app.get('/api/tax/state/:state', (req, res) => {
    const file = path.join(__dirname, 'data/state_tax_data.json');
    const stateName = req.params.state.toLowerCase();
  
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!data[stateName]) {
        return res.status(404).json({ message: "State not found in YAML" });
      }
      res.json(data[stateName]);
    } catch {
      res.status(500).send("Internal Server Error");
    }
  });
  