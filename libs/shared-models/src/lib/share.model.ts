export interface ShareSubscription {
  id?: string;
  memberId: string;
  units: number;
  totalAmount: number;
  subscriptionDate: number;
  remark?: string;
  createdAt?: number;
}

export interface SharePurchase {
  id?: string;
  memberId: string;
  units: number;
  totalAmount: number;
  purchaseDate: number;
  bankId?: string;
  transactionReference?: string;
  serviceFee?: number;
  remark?: string;
  transferId?: string;
  createdAt?: number;
}

export interface ShareTransfer {
  id?: string;
  sourceMemberId: string;
  destinationMemberId: string;
  units: number;
  totalAmount: number;
  transferDate: number;
  ftp: string;
  remark?: string;
  createdAt?: number;
}
