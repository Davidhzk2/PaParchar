export type Gender = 'male' | 'female';

export interface Player {
  name: string;
  gender: string;
  avatar: string;
  preferGender: string;
}

export interface Avatar{
  src: string;
  artboard: string;
  stateMachine: string;
  gender: string;
  stateBool?: boolean;
}