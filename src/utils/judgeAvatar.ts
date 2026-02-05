/**
 * Judge Avatar Utility
 * 
 * Generates consistent random robot profile pictures for judges.
 * Uses Robohash API which creates unique robot avatars based on any input string.
 * The same judge ID will always generate the same robot avatar.
 */

/**
 * Generates a consistent robot avatar URL for a judge based on their ID.
 * Uses Robohash API which creates unique robot avatars from any string.
 * 
 * Robohash API options:
 * - set1: Robots with different styles
 * - set2: Monsters
 * - set3: Robot heads
 * - set4: Cat robots
 * - set5: Custom robots
 * 
 * @param judgeId - The unique ID of the judge
 * @param set - The robot set to use (1-5, default: 1)
 * @returns URL to a unique robot avatar
 */
export function getJudgeAvatarUrl(judgeId: string, set: number = 1): string {
  // Robohash API: https://robohash.org/{text}?set=set{1-5}
  // The same text always generates the same robot
  // Adding judgeId ensures uniqueness while maintaining consistency
  const encodedId = encodeURIComponent(judgeId);
  return `https://robohash.org/${encodedId}?set=set${set}&size=150x150`;
}
