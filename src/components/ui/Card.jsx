import { clsx } from "clsx"

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={clsx("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
      {children}
    </div>
  )
}

export default Card
