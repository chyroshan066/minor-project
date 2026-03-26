import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { Children, ClassName } from "@/types";
import { Card } from "../ui/card";
import { GALLERY_PROJECTS } from "@/lib/constants";
import { Button } from "../ui/Button";
import { AvatarGroup } from "../ui/AvatarGroup";

interface ProjectCardColumnProps extends Children, ClassName {}

const ProjectCardColumn = ({ children, className }: ProjectCardColumnProps) => (
  <div className="w-full max-w-full px-3 mb-6 md:w-6/12 md:flex-none xl:mb-0 xl:w-3/12">
    <div
      className={`relative flex flex-col min-w-0 break-words bg-transparent shadow-none rounded-2xl bg-clip-border ${className}`}
    >
      {children}
    </div>
  </div>
);

export const ProjectGalleryCard = () => (
  <Card
    outerDivClassName="flex-none mt-6"
    innerDivClassName="mb-6 bg-surface shadow-soft-xl"
  >
    <div className="p-4 pb-0 mb-0 bg-surface rounded-t-2xl">
      <h6 className="mb-1">Projects</h6>
      <p className="leading-normal text-sm">Architects design houses</p>
    </div>
    <div className="flex-auto p-4">
      <div className="flex flex-wrap -mx-3">
        {GALLERY_PROJECTS.map((project) => (
          <ProjectCardColumn key={project.id} className="border-0 h-full">
            <div className="relative">
              <Link
                href="#"
                className="block shadow-xl rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2"
              >
                <Image
                  src={project.img}
                  alt={project.category}
                  width={500}
                  height={300}
                  className="max-w-full shadow-soft-2xl rounded-2xl"
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                />
              </Link>
            </div>
            <div className="flex flex-col flex-auto px-1 pt-6 h-full">
              <p className="relative z-10 mb-2 leading-normal text-transparent bg-gradient-dark text-sm bg-clip-text">
                {project.category}
              </p>
              <Link
                href="#"
                className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2"
              >
                <h5>{project.title}</h5>
              </Link>
              <p className="mb-6 leading-normal text-sm">
                {project.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <Button
                  className="active:shadow-soft-xs hover:border-primary hover:bg-transparent hover:text-primary hover:shadow-none active:bg-primary active:text-surface active:hover:bg-transparent active:hover:text-primary"
                  btnText="View Project"
                />
                <AvatarGroup participants={project.participants} />
              </div>
            </div>
          </ProjectCardColumn>
        ))}
        <ProjectCardColumn className="h-full border border-solid border-slate-100">
          <Link
            href="#"
            className="flex flex-col items-center justify-center w-full h-full min-h-[225px] p-6 text-center rounded-2xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2 group"
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="mb-4 text-disabled transition-colors group-hover:text-primary group-focus-visible:text-primary"
            />
            <h5 className="text-disabled transition-colors group-hover:text-primary group-focus-visible:text-primary">
              New project
            </h5>
          </Link>
        </ProjectCardColumn>
      </div>
    </div>
  </Card>
);
