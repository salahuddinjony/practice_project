import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file, here quiet:true means if the .env file is missing, it won't throw an error and will just ignore it., if you want to make sure the .env file is present, you can set it to false or remove the quiet option.
dotenv.config({ path: path.join(process.cwd(), '.env'), quiet: true });

// Export the configuration object with the necessary environment variables. The PORT variable defaults to 3000 if not set, and MONGO_URI is required (you can adjust this as needed).
export default {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI as string || '',
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS) : 10, // Default to 10 if not set
    DEFAULT_USER_PASSWORD: process.env.DEFAULT_USER_PASSWORD as string || '123456'// Default password if not set
}