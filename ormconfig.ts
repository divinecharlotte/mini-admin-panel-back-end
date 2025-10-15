import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';


export default new DataSource({
  type: 'sqlite',
  database: 'data/sqlite.db',
  synchronize: true,
  entities: [User],
});
