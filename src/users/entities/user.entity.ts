import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    role: string;

    @Column()
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'text', nullable: true})
    emailHash?: string;

    @Column({type: 'text', nullable: true})
    signature?: string;
}
