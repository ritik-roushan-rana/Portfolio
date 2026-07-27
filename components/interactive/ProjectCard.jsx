"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";

/**
 * Project card with a preview that reveals on hover (desktop) or tap (touch).
 *
 * The reveal is expressed two ways in CSS: a :hover rule wrapped in
 * `@media (hover: hover)` for pointer devices, and a [data-open="true"]
 * attribute for touch, toggled here. That keeps touch devices off hover styles
 * entirely rather than relying on sticky-hover behaviour.
 *
 * `project.preview` (image) and `project.previewVideo` are both optional. With
 * neither, the reveal still runs against the card's existing generated artwork,
 * so it degrades to a colour and depth shift rather than an empty box.
 */
export default function ProjectCard({
  project,
  index,
  descExpanded,
  techExpanded,
  onToggleDesc,
  onToggleTech,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(!window.matchMedia("(hover: hover)").matches);
  }, []);

  // On touch, the first tap on the media area reveals the preview. Links inside
  // stay real anchors, so a second tap follows them normally.
  const handleMediaClick = useCallback(() => {
    if (isTouch) setIsOpen((open) => !open);
  }, [isTouch]);

  const primaryLink = project.demo || project.github;
  const hasMedia = Boolean(project.preview || project.previewVideo);

  return (
    <div
      className="project-card group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-950/95 to-black/95 backdrop-blur-sm border border-gray-800/60 hover:border-cyan-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/20 shadow-lg shadow-black/50"
      data-open={isOpen ? "true" : "false"}
    >
      {/* Project Preview/Header */}
      <div
        className="project-card__media relative h-36 bg-gradient-to-br from-gray-900 to-black overflow-hidden"
        onClick={handleMediaClick}
        role={isTouch ? "button" : undefined}
        tabIndex={isTouch ? 0 : undefined}
        aria-expanded={isTouch ? isOpen : undefined}
        onKeyDown={
          isTouch
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsOpen((open) => !open);
                }
              }
            : undefined
        }
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div
            className={`w-full h-full bg-gradient-to-r ${project.color} opacity-20`}
          />
        </div>

        {/* Floating Tech Icons */}
        <div className="project-card__glyph absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className={`p-3 rounded-xl bg-gradient-to-r ${project.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <project.icon className="h-6 w-6 text-white" />
            </div>

            {/* Orbiting elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping opacity-75" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff41' fill-opacity='0.1'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 30h60M30 0v60' stroke='%2300ff41' stroke-width='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Preview media, revealed on hover/tap */}
        {hasMedia && (
          <div className="project-card__preview">
            {project.previewVideo ? (
              <video
                className="project-card__preview-media"
                src={project.previewVideo}
                muted
                loop
                playsInline
                preload="none"
                poster={project.preview}
              />
            ) : (
              <Image
                src={project.preview}
                alt=""
                fill
                sizes="(max-width: 768px) 90vw, 420px"
                className="project-card__preview-media object-cover"
              />
            )}
          </div>
        )}

        {/* Wash that lifts the artwork when no screenshot is supplied */}
        {!hasMedia && (
          <div
            className={`project-card__wash bg-gradient-to-br ${project.color}`}
          />
        )}

        {/* Slide-up overlay: tech stack + view link */}
        <div className="project-card__overlay">
          <div className="project-card__overlay-tech">
            {project.tech.slice(0, 4).map((tech) => (
              <span key={tech} className="project-card__chip">
                {tech}
              </span>
            ))}
          </div>
          {primaryLink && (
            <a
              href={primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__cta"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View project</span>
            </a>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="p-5 relative">
        {/* Title with gradient text */}
        <h3 className="text-lg font-bold mb-2 font-mono bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-green-400 transition-all duration-300">
          {project.title}
        </h3>

        {/* Description */}
        <div className="mb-4">
          <p
            className={`text-gray-400 font-mono text-xs leading-relaxed ${
              descExpanded ? "" : "line-clamp-3"
            }`}
          >
            {project.description}
          </p>
          {project.description.length > 120 && (
            <button
              onClick={() => onToggleDesc(index)}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-xs mt-1 transition-colors"
            >
              {descExpanded ? "show less" : "read more..."}
            </button>
          )}
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(techExpanded ? project.tech : project.tech.slice(0, 5)).map(
            (tech, techIndex) => (
              <span
                key={techIndex}
                className="px-2 py-1 text-xs font-mono bg-gray-800/80 text-gray-300 rounded-full border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
              >
                {tech}
              </span>
            )
          )}
          {project.tech.length > 5 && (
            <button
              onClick={() => onToggleTech(index)}
              className="px-2 py-1 text-xs font-mono bg-gray-800/80 text-gray-500 hover:text-cyan-400 rounded-full border border-gray-600/50 hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              {techExpanded ? "show less" : `+${project.tech.length - 5}`}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {project.github && (
            <button
              onClick={() => window.open(project.github, "_blank")}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-green-600 hover:to-cyan-600 text-white font-mono text-xs rounded-lg border border-gray-600 hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center justify-center space-x-1.5"
            >
              <Github className="h-3.5 w-3.5" />
              <span>VIEW CODE</span>
            </button>
          )}

          {project.demo && (
            <button
              onClick={() => window.open(project.demo, "_blank")}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center justify-center space-x-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>LIVE DEMO</span>
            </button>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
        <div
          className={`w-full h-full bg-gradient-to-bl ${project.color} transform rotate-45 translate-x-10 -translate-y-10`}
        />
      </div>
    </div>
  );
}
