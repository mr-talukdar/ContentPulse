import type { PostStatus } from "./types";

const transitions: Record<PostStatus, readonly PostStatus[]> = {
  draft: ["generating"],
  generating: ["review"],
  review: ["rejected", "approved"],
  rejected: ["generating"],
  approved: ["scheduled"],
  scheduled: ["published"],
  published: [],
};

export function canTransition(from: PostStatus, to: PostStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: PostStatus, to: PostStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Cannot transition post from '${from}' to '${to}'.`);
  }
}

export function transitionStatus(from: PostStatus, to: PostStatus): PostStatus {
  assertTransition(from, to);
  return to;
}

export function validNextStatuses(status: PostStatus): readonly PostStatus[] {
  return transitions[status];
}
