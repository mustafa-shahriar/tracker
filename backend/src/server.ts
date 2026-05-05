import { app } from "./app.ts";
import { PORT } from "./config.ts";

app.listen(PORT, () => console.log(`App running on port ${PORT}`))
