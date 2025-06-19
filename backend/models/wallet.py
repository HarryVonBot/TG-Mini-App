# Wallet and crypto model definitions
from pydantic import BaseModel
from typing import Optional, List

class WalletVerification(BaseModel):
    message: str
    signature: str
    address: str

class CryptoAsset(BaseModel):
    symbol: str
    name: str
    balance: float
    usd_value: float
    price_per_token: Optional[float] = None

class WalletBalance(BaseModel):
    address: str
    total_usd_value: float
    assets: List[CryptoAsset]

class BankAccount(BaseModel):
    id: Optional[str] = None
    account_name: str
    account_type: str
    balance: float
    currency: str = "USD"
    last_updated: Optional[str] = None