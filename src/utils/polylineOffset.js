export class PolylineOffset {
            static offsetLine(coordinates, offset) {
                if (coordinates.length < 2) return coordinates;
                
                const segments = [];
                
                // Create offset segments
                for (let i = 0; i < coordinates.length - 1; i++) {
                    const a = coordinates[i];
                    const b = coordinates[i + 1];
                    
                    const dx = b[0] - a[0];
                    const dy = b[1] - a[1];
                    const len = Math.sqrt(dx * dx + dy * dy);
                    
                    if (len === 0) continue;
                    
                    // Perpendicular vector (rotated 90 degrees)
                    const perpX = -dy / len;
                    const perpY = dx / len;
                    
                    segments.push({
                        original: [a, b],
                        offset: [
                            [a[0] + perpX * offset, a[1] + perpY * offset],
                            [b[0] + perpX * offset, b[1] + perpY * offset]
                        ]
                    });
                }
                
                // Join segments
                const result = [];
                if (segments.length > 0) {
                    result.push(segments[0].offset[0]);
                    
                    for (let i = 0; i < segments.length - 1; i++) {
                        const s1 = segments[i];
                        const s2 = segments[i + 1];
                        
                        // Find intersection of offset lines
                        const intersection = this.lineIntersection(
                            s1.offset[0], s1.offset[1],
                            s2.offset[0], s2.offset[1]
                        );
                        
                        if (intersection) {
                            result.push(intersection);
                        } else {
                            result.push(s1.offset[1]);
                            result.push(s2.offset[0]);
                        }
                    }
                    
                    result.push(segments[segments.length - 1].offset[1]);
                }
                
                return result;
            }
            
            static lineIntersection(p1, p2, p3, p4) {
                const x1 = p1[0], y1 = p1[1];
                const x2 = p2[0], y2 = p2[1];
                const x3 = p3[0], y3 = p3[1];
                const x4 = p4[0], y4 = p4[1];
                
                const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                if (Math.abs(denom) < 0.0000001) return null;
                
                const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
                
                return [
                    x1 + t * (x2 - x1),
                    y1 + t * (y2 - y1)
                ];
            }
        }