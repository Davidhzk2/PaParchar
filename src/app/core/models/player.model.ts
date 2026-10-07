export type Gender = 'male' | 'female';

export interface Player {
  name: string;
  gender: Gender;
  avatar: Avatar;
  preferGender: Gender | 'both';
}

export interface Avatar {
  src: string;
  artboard: string;
  stateMachine: string;
  gender: Gender;
  stateBool?: boolean;
}