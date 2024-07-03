class Codec8EHandler {
    parseData(buffer) {
        let index = 0;
        // Header
        const preamble = buffer.readInt32BE(index);
        const dataLength = buffer.readInt32BE(index + 4);
        const codecID = buffer.readInt8(index + 8);
        const numberOfRecords = buffer.readInt8(index + 9);
        index += 10;

        const records = [];
        for (let i = 0; i < numberOfRecords; i++) {
            // Record parsing
            const timestamp = buffer.readBigInt64BE(index);
            index += 8;
            const priority = buffer.readInt8(index);
            index += 1;
            const longitude = buffer.readDoubleBE(index);
            index += 8;
            const latitude = buffer.readDoubleBE(index);
            index += 8;
            const altitude = buffer.readInt16BE(index);
            index += 2;
            const angle = buffer.readInt16BE(index);
            index += 2;
            const satellites = buffer.readInt8(index);
            index += 1;
            const speed = buffer.readInt16BE(index);
            index += 2;

            // I/O Elements parsing
            const ioEventId = buffer.readInt8(index);
            index += 1;
            const elementCount = buffer.readInt8(index);
            index += 1;

            const ioElements = [];
            for (let j = 0; j < elementCount; j++) {
                const ioId = buffer.readInt8(index);
                const ioType = this.determineIoType(ioId);
                let ioValue;
                switch (ioType) {
                    case 1: // 1-byte
                        ioValue = buffer.readInt8(index + 1);
                        index += 2;
                        break;
                    case 2: // 2-byte
                        ioValue = buffer.readInt16BE(index + 1);
                        index += 3;
                        break;
                    case 4: // 4-byte
                        ioValue = buffer.readInt32BE(index + 1);
                        index += 5;
                        break;
                    case 8: // 8-byte
                        ioValue = buffer.readBigInt64BE(index + 1);
                        index += 9;
                        break;
                }
                ioElements.push({ ioId, ioValue });
            }

            records.push({ timestamp, priority, longitude, latitude, altitude, angle, satellites, speed, ioEventId, ioElements });
        }

        return { preamble, dataLength, codecID, records };
    }

    determineIoType(ioId) {
        // Example logic based on hypothetical I/O ID types
        if ([1, 2, 3].includes(ioId)) return 1; // 1-byte
        if ([4, 5].includes(ioId)) return 2; // 2-byte
        if ([6, 7].includes(ioId)) return 4; // 4-byte
        if ([8].includes(ioId)) return 8; // 8-byte
        return 1; // Default to 1-byte if unknown
    }
}

module.exports = new Codec8EHandler();
