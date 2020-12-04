/* eslint-disable import/no-internal-modules */
import _difference from 'lodash/difference';
import _intersection from 'lodash/intersection';
import _partition from 'lodash/partition';

export function findIntersectionOfSets<T>(set1: T[] = [], set2: T[] = []) {
	return {
		rightDifference: _difference(set2, set1),
		intersection: _intersection(set1, set2),
		leftDifference: _difference(set1, set2),
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function partition<T>(collection: T[], condition: any): [T[], T[]] {
	return _partition(collection, condition);
}

export function getRandomArray<T>(array: T[], count: number): T[] {
	const randomArray: T[] = [];

	while (randomArray.length !== count) {
		randomArray.push(
			array.splice(Math.floor(Math.random() * array.length), 1)[0],
		);
	}

	return randomArray;
}
