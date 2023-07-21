import { wildcardComparison } from '../src/toolbox/wildcardComparison';

describe('wildcardComparison', () => {
    test('should return true for "projector/tv/*" and "projector/tv/control"', () => {
        const result = wildcardComparison('projector/tv/*', 'projector/tv/control');
        expect(result).toBe(true);
    });

    test('should return false for "projector/tv/*" and "projector/screen/control"', () => {
        const result = wildcardComparison('projector/tv/*', 'projector/screen/control');
        expect(result).toBe(false);
    });

    test('should return true for "projector/*/control" and "projector/tv/control"', () => {
        const result = wildcardComparison('projector/*/control', 'projector/tv/control');
        expect(result).toBe(true);
    });

    test('should return true for "projector/*/control" and "projector/tv/banana/control"', () => {
        const result = wildcardComparison('projector/*/control', 'projector/tv/banana/control');
        expect(result).toBe(true);
    });

    test('should return true for "*/control" and "projector/screen/control"', () => {
        const result = wildcardComparison('*/control', 'projector/screen/control');
        expect(result).toBe(true);
    });

    test('should return false for "*/control" and "projector/screen/power"', () => {
        const result = wildcardComparison('*/control', 'projector/screen/power');
        expect(result).toBe(false);
    });

    test('should return false for "projector/*/control" and "projector/tv/banana/control/apple"', () => {
        const result = wildcardComparison('projector/*/control', 'projector/tv/banana/control/apple');
        expect(result).toBe(false);
    });
});
