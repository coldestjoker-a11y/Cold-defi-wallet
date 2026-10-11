use secp256k1::{Secp256k1, Message, SecretKey};
use sha3::{Digest, Keccak256};

pub struct RustEnclave {
    enclave_key_share: SecretKey,
}

impl RustEnclave {
    pub fn sign_defi_transaction(&self, tx_data: &[u8]) -> Result<Vec<u8>, &'static str> {
        let secp = Secp256k1::new();
        let mut hasher = Keccak256::new();
        hasher.update(tx_data);
        let tx_hash = hasher.finalize();

        let message = Message::from_slice(&tx_hash).expect("Invalid hash length");
        let partial_sig = secp.sign_ecdsa(&message, &self.enclave_key_share);

        Ok(partial_sig.serialize_compact().to_vec())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rust_enclave_signing() {
        let secp = Secp256k1::new();
        let (secret_key, _) = secp.generate_keypair(&mut secp256k1::rand::thread_rng());
        let enclave = RustEnclave { enclave_key_share: secret_key };
        let tx_data = b"transfer(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1000000000000000000)";
        let sig = enclave.sign_defi_transaction(tx_data).expect("Signing failed");
        assert_eq!(sig.len(), 64, "ECDSA compact signature must be exactly 64 bytes");
    }
}
