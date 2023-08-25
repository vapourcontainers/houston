export interface IProject {
  image: string;
  footages: IProjectFootage[];
  targets: IProjectTarget[];
  upload: IProjectUpload;
}

export interface IProjectFootage {
  source: string;
  target: string;
}

export interface IProjectTarget {
  script: string;
  output: string;
}

export interface IProjectUpload {
  prefix: string;
}
