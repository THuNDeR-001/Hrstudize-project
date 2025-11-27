#!/bin/bash

# Proof of Submission Generator
# This script generates cryptographic proof of submission

echo "Generating proof of submission..."

# Read the challenge
CHALLENGE=$(cat challenge.txt)
echo "Challenge: $CHALLENGE"

# Get the latest commit hash
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "no-git-repo")
echo "Commit Hash: $COMMIT_HASH"

# Concatenate challenge + commit_hash
MESSAGE="${CHALLENGE}${COMMIT_HASH}"
echo "Message to sign: $MESSAGE"

# Compute SHA256 of the concatenation
MESSAGE_HASH=$(echo -n "$MESSAGE" | openssl dgst -sha256 -binary | xxd -p -c 256)
echo "Message SHA256: $MESSAGE_HASH"

# Generate ECDSA key pair (secp256r1/prime256v1)
if [ ! -f "proof_priv.pem" ]; then
    echo "Generating ECDSA key pair..."
    openssl ecparam -name prime256v1 -genkey -noout -out proof_priv.pem
    openssl ec -in proof_priv.pem -pubout -out proof_pub.pem
    echo "Key pair generated: proof_priv.pem and proof_pub.pem"
else
    echo "Using existing key pair"
fi

# Sign the message hash
echo -n "$MESSAGE" | openssl dgst -sha256 -sign proof_priv.pem | base64 > proof.txt
echo "Signature created: proof.txt"

# Verify the signature
echo ""
echo "Verifying signature..."
VERIFY_RESULT=$(echo -n "$MESSAGE" | openssl dgst -sha256 -verify proof_pub.pem -signature <(base64 -d proof.txt) && echo "SUCCESS" || echo "FAILED")

if [ "$VERIFY_RESULT" = "SUCCESS" ]; then
    echo "✓ Signature verification: SUCCESS"
else
    echo "✗ Signature verification: FAILED"
fi

echo ""
echo "=== Proof Generation Complete ==="
echo "Files created:"
echo "  - challenge.txt (challenge string)"
echo "  - proof.txt (signature in base64)"
echo "  - proof_pub.pem (public key)"
echo "  - proof_priv.pem (private key - keep secure)"
echo ""
echo "Outputs for SUBMISSION.md:"
echo "  Challenge: $CHALLENGE"
echo "  Commit Hash: $COMMIT_HASH"
echo "  SHA256: $MESSAGE_HASH"
