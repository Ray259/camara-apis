import {
  Model,
  Column,
  Table,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({ tableName: 'call_forwardings', timestamps: false })
export class CallForwardingModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  phoneNumber: string;

  @Column({ type: DataType.BOOLEAN })
  unconditionalActive: boolean;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  conditionalStatuses: string[];
}
